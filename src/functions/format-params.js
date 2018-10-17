const formatParams = ({ s3Object, key }) =>{
  // key struct =   `version/identifier/hashedURL/presetHash/mode/...
  const params = key.split('/')
  const identifier = params[1]
  const preset = params.length > 2 ? params[3] : null
  return({
    lastModified: s3Object.LastModified,
    contentLength: s3Object.ContentLength,
    contentType: s3Object.ContentType,
    key,
    identifier,
    preset,
    originUrl: s3Object.Metadata && s3Object.Metadata['origin-url'] || null
  })
}
export default formatParams
