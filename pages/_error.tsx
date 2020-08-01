import Head from "next/head";

const statusCodes: { [code: number]: string } = {
  400: "Bad Request",
  404: "This page could not be found",
  405: "Method Not Allowed",
  500: "Internal Server Error",
};

function Error({ statusCode, ...props }) {
  const title =
    props.title ||
    statusCodes[statusCode] ||
    "An unexpected error has occurred";

  return (
    <div>
      <Head>
        <title>
          {statusCode}: {title}
        </title>
      </Head>

      <div>
        {statusCode ? <h1>{statusCode}</h1> : null}
        <div>
          <h2>{title}.</h2>
        </div>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
