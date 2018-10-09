import mediaMapping from 'mapping/media'
import s3 from 'infrastructure/s3'
import media from 'services/media'
import elastic from 'services/elastic'


async function fetchPage ({ bucket, prefix, maxKeys, nextToken }) {

  const params = {
    Bucket: bucket,
    Prefix: prefix || null,
    MaxKeys: maxKeys,
    ContinuationToken: nextToken || null
  }

  const {
    Contents,
    NextContinuationToken,
    IsTruncated
  } = await s3.listObjectsV2(params).promise()

  await Contents.reduce(
    async (previousJob, file) => {
      await previousJob

      console.log('PUSH_FILE -> ', file.Key)

      const object = await s3.headObject({
        Bucket: bucket,
        Key: file.Key
      }).promise()

      const params = {
        lastModified: object.LastModified,
        contentLength: object.ContentLength,
        eTag: object.ETag,
        contentType: object.ContentType,
        key: file.Key,
        originUrl: object.Metadata && object.Metadata['origin-url'] || null
      }

      const fileExists = await elastic.checkExists({
        index: 'media',
        type: 'media',
        id: file.Key
      })

      if (fileExists) {
        await elastic.update({
          index: 'media',
          type: 'media',
          id: file.Key,
          params
        })
      }else {
        await elastic.create({
          index: 'media',
          type: 'media',
          id: file.Key,
          params
        })
      }

    },
    Promise.resolve()
  )

  if (IsTruncated) {
    return await fetchPage({ bucket, prefix, maxKeys, NextContinuationToken })
  } else {
    console.log('FINISH')
    return true
  }
}


export default async (event, respond) => {

  const { bucket, prefix } = JSON.parse(event.body)
  await elastic.initMapping("media", "media", mediaMapping)

  try {
    await fetchPage({ bucket, prefix, maxKeys: 10 })
    return {
      status: 200,
      body: JSON.stringify({
        message: "success"
      })
    }
  } catch (error) {
    return {
      status: 500,
      body: JSON.stringify({
        message: `Error push ${ error }`
      })
    }
  }

}
