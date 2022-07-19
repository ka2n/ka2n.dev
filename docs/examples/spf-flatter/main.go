package main

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/StackExchange/dnscontrol/pkg/spflib"
	"github.com/google/go-cmp/cmp"
	"github.com/google/go-cmp/cmp/cmpopts"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/dns/v1"
	"google.golang.org/api/option"
)

const (
	TEMPLATE_HOST = "_spf.example.com"
	FQDN          = "example.com"
)

func main() {
	ctx := context.Background()

	// テンプレートを取得
	// この例では、_spf.example.comのTXTレコードから元になるSPFレコードを取得しているが、コマンドラインから入力を受け付けるようにしてもOK
	templateSPF, _ := FetchSPFRecordFromDomain(ctx, TEMPLATE_HOST)

	// 展開
	records, _ := GenerateSPFRecords(templateSPF)

	// GCP Cloud DNSを操作するためのクライアント
	dns, _ := NewDNSService(ctx, "example-project", "example-zone", FQDN)

	// 現在の設定内容と比較して、追加・削除を計算
	change, _ := dns.Plan(ctx, records)
	if PlanIsEmpty(change) {
		return
	}

	// 設定を適用
	dns.Apply(ctx, change)
}

// GenerateSPFRecords SPFレコードを生成します
func GenerateSPFRecords(input string) (map[string]string, error) {
	// パース
	resolver := new(spflib.LiveResolver)
	r, err := spflib.Parse(input, resolver)
	if err != nil {
		return nil, err
	}

	// いくつかのドメインのみを展開する
	fr := r.Flatten(strings.Join([]string{
		"_spf.google.com",
		"_spf.firebasemail.com",
	}, ","))

	if err := removeDuplicated(fr); err != nil {
		return nil, err
	}

	// 長くなる場合を考慮しつつ展開
	//
	// 長い場合(255文字以上)は下記のように複数レコードに分割される
	// - @: "v=spf1 include:_spf1.example.com include:_spf2.example.com -all"
	// - _spf1: "v=spf1 ..... -all"
	// - _spf2: "v=spf1 ..... -all"
	rs := fr.TXTSplit("_spf%d.example.com")
	return rs, nil
}

// removeDuplicated SPFレコードから重複したincludeを削除する
func removeDuplicated(r *spflib.SPFRecord) error {
	filtered := make([]*spflib.SPFPart, 0)
	remember := make(map[string]struct{})
	for _, v := range r.Parts {
		if v.IncludeDomain != "" {
			_, exist := remember[v.IncludeDomain]
			if exist {
				continue
			}
			remember[v.IncludeDomain] = struct{}{}
		}
		filtered = append(filtered, v)
	}
	r.Parts = filtered
	return nil
}

// FetchSPFRecordFromDomain ドメインのSPFレコードを取得します
func FetchSPFRecordFromDomain(ctx context.Context, domain string) (string, error) {
	r := new(spflib.LiveResolver)
	return r.GetSPF(domain)
}

type DNSService struct {
	projectID string
	zone      string
	fqdn      string

	client *dns.Service
}

// NewDNSService google APIのDNS管理サービスを取得します
func NewDNSService(ctx context.Context, projectID string, zone string, fqdn string) (*DNSService, error) {
	client, err := google.DefaultClient(ctx, dns.CloudPlatformScope)
	if err != nil {
		return nil, fmt.Errorf("failed to create google client: %w", err)
	}

	svc, err := dns.NewService(ctx, option.WithHTTPClient(client))
	if err != nil {
		return nil, fmt.Errorf("failed to create dns service: %w", err)
	}

	return &DNSService{
		client:    svc,
		projectID: projectID,
		zone:      zone,
		fqdn:      fqdn,
	}, nil
}

func PlanIsEmpty(change *dns.Change) bool {
	return cmp.Equal(change.Deletions, change.Additions,
		cmpopts.SortSlices(func(i, j int) bool {
			return i < j
		}),
		cmpopts.IgnoreFields(
			dns.ResourceRecordSet{},
			"Kind",
			"RoutingPolicy",
			"ForceSendFields",
			"SignatureRrdatas",
			"NullFields",
		),
	)
}

func (s *DNSService) Apply(ctx context.Context, change *dns.Change) error {

	chg, err := s.client.Changes.Create(s.projectID, s.zone, change).Do()
	if err != nil {
		return err
	}

	for chg.Status == "pending" {
		time.Sleep(time.Second)

		chg, err = s.client.Changes.Get(s.projectID, s.zone, chg.Id).Do()
		if err != nil {
			return err
		}
	}
	return nil
}

// Plan 現在の設定内容から records の内容にするための *dns.Changeを計算します
func (s *DNSService) Plan(ctx context.Context, records map[string]string) (*dns.Change, error) {
	change := &dns.Change{
		Deletions: []*dns.ResourceRecordSet{},
		Additions: []*dns.ResourceRecordSet{},
	}

	rsets := make([]*dns.ResourceRecordSet, 0)
	var pageToken string
	for {
		call := s.client.ResourceRecordSets.List(s.projectID, s.zone)
		if pageToken != "" {
			call = call.PageToken(pageToken)
		}
		r, err := call.Do()
		if err != nil {
			return nil, fmt.Errorf("failed to list dns record: %w", err)
		}
		rsets = append(rsets, r.Rrsets...)

		pageToken = r.NextPageToken
		if pageToken == "" {
			break
		}
	}

	// NOTE: 変更後に未使用のレコードは削除しません
	for domain, record := range records {
		var name string
		if domain == "@" {
			name = s.fqdn
		} else {
			name = domain + "."
		}

		// Delete
		// 削除のオペレーションを追加, Rrdataは一旦全部削除に入れて追加にも入れる
		rdata := []string{}
		for _, r := range rsets {
			if r.Type != "TXT" {
				continue
			}
			if r.Name == name {
				change.Deletions = append(change.Deletions, r)
				rdata = append(rdata, r.Rrdatas...)
				break
			}
		}

		// Create

		// rdataは既存のものからSPFレコードを除く
		for i, rr := range rdata {
			if strings.HasPrefix(rr, "\"v=spf1") {
				rdata = append(rdata[:i], rdata[i+1:]...)
				break
			}
		}
		rdata = append(rdata, fmt.Sprintf("\"%s\"", record))

		change.Additions = append(change.Additions, &dns.ResourceRecordSet{
			Name:    name,
			Type:    "TXT",
			Rrdatas: rdata,
			Ttl:     300,
		})
	}

	return change, nil
}
