const formatParams = ({ s3Object, key, identifier, preset }) => ({
  lastModified: s3Object.LastModified,
  contentLength: s3Object.ContentLength,
  contentType: s3Object.ContentType,
  key,
  identifier,
  preset,
  originUrl: s3Object.Metadata && s3Object.Metadata['origin-url'] || null
})
export default formatParams
