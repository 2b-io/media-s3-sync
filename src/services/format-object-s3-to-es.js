export default (s3Object, key, lastSynchronized) => {
  // key origin = `version/identifier/hashedURL`
  // key target = `version/identifier/hashedURL/presetHash/mode_widthxheight.ext`
  // key target = `version/identifier/hashedURL/presetHash.ext (eg. image/svg+xml)`
  const params = key.split('/')
  const preset = params[ 3 ] ? params[ 3 ].split('.').shift() : null

  return {
    key,
    preset,
    contentLength: s3Object.ContentLength,
    contentType: s3Object.ContentType,
    expires: s3Object.Expires,
    isOrigin: s3Object.Metadata && s3Object.Metadata[ 'origin-url' ] ? true : false,
    lastModified: s3Object.LastModified,
    lastSynchronized,
    originUrl: s3Object.Metadata && s3Object.Metadata[ 'origin-url' ] || null
  }
}
