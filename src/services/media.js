export default {
  async head(key) {
    return await s3.headObject({
      Bucket: s3.config.bucket,
      Key: cloudPath(key)
    }).promise()
  }
}
