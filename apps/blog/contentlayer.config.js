import { defineDocumentType, makeSource} from "contentlayer/source-files"

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `posts/**/*.(md|mdx)`,
  fields: {
    title: {
      type: 'string',
      required: true
    },
  }
}))

export default makeSource({
  contentDirPath: "content",
  documentTypes: [Post]
})
