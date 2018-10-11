import serializeError from 'serialize-error'

import formatParams from './format-params'
import mediaMapping from 'mapping/media'
import media from 'services/media'
import elasticSearch from 'services/elastic-search'

async function fetchPage({ bucket, prefix, maxKeys, nextToken }) {
  const params = {
    Bucket: bucket,
    Prefix: prefix || null,
    MaxKeys: maxKeys,
    ContinuationToken: nextToken || null
  }
  const {
    Contents,
    NextContinuationToken: _nextToken,
    IsTruncated
  } = await media.list({ bucket, params })

  await Contents.reduce(
    async (previousJob, file) => {
      await previousJob
      console.log('PUSH_FILE -> ', file.Key)

      try {
        const s3Object = await media.head({
          bucket,
          key: file.Key
        })
        const params = formatParams({ s3Object, key: file.Key })
        await elasticSearch.createOrUpdate({
          index: 'media',
          type: 'media',
          id: file.Key,
          params
        })
      } catch (error) {
        console.log(serializeError(error))
      }

    },
    Promise.resolve()
  )

  if (IsTruncated) {
    return await fetchPage({
      bucket,
      prefix,
      maxKeys,
      nextToken: _nextToken
    })
  } else {
    console.log('FINISH')
    return true
  }
}

export default async (event, respond) => {
  const { bucket, prefix } = JSON.parse(event.body)
  await elasticSearch.initMapping({
    index: "media",
    type: "media",
    params: mediaMapping
  })

  try {
    await fetchPage({ bucket, prefix, maxKeys: 10 })
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "success"
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: serializeError(error)
    }
  }

}
