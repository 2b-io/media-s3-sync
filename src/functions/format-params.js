const formatMediaData = async ({ s3Object, key }) => {
  return {
    lastModified: s3Object.LastModified,
    contentLength: s3Object.ContentLength,
    eTag: s3Object.ETag,
    contentType: s3Object.ContentType,
    key,
    originUrl: s3Object.Metadata && s3Object.Metadata['origin-url'] || null
  }
}
export default formatMediaData
