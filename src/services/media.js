import s3 from 'infrastructure/s3'
import config from 'infrastructure/config'

export default {
  async head(key) {
    return await s3.headObject({
      Bucket: config.aws.s3.bucket,
      Key: key
    }).promise()
  },
  async list(params) {
    return await s3.listObjectsV2({
      Bucket: config.aws.s3.bucket,
      ...params
    }).promise()
  }
}
