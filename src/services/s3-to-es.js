export default ({ s3Object, key }) => {
  // key origin = `version/identifier/hashedURL`
  // key target = `version/identifier/hashedURL/presetHash/...`
  const params = key.split('/')
  const preset = params[ 3 ] || null

  return {
    key,
    preset,
    contentLength: s3Object.ContentLength,
    contentType: s3Object.ContentType,
    expires: s3Object.Expires,
    isOrigin: s3Object.Metadata && s3Object.Metadata[ 'origin-url' ] ? true : false,
    lastModified: s3Object.LastModified,
    lastSynchronized: new Date(),
    originUrl: s3Object.Metadata && s3Object.Metadata[ 'origin-url' ] || null
  }
}
