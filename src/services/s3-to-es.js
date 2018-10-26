const formatParams = ({ s3Object, key }) => {
  // key origin = `version/identifier/hashedURL`
  // key target = `version/identifier/hashedURL/presetHash/...`
  const params = key.split('/')
  const preset = params[ 3 ] || null

  return {
    key,
    preset,
    lastModified: s3Object.LastModified,
    contentLength: s3Object.ContentLength,
    contentType: s3Object.ContentType,
    isOrigin: s3Object.Metadata && s3Object.Metadata[ 'origin-url' ] ? true : false,
    originUrl: s3Object.Metadata && s3Object.Metadata[ 'origin-url' ] || null
  }
}

export default formatParams
