const formatParams = ({ s3Object, key }) => {
  // key origin = `version/identifier/hashedURL`
  // key target = `version/identifier/hashedURL/presetHash/...`
  const params = key.split('/')
  const identifier = params[1]
  const preset = params[3] || null
  
  return {
    key,
    identifier,
    preset,
    lastModified: s3Object.LastModified,
    contentLength: s3Object.ContentLength,
    contentType: s3Object.ContentType,
    originUrl: s3Object.Metadata && s3Object.Metadata['origin-url'] || null
  }
}

export default formatParams
