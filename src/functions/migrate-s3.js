import migrate from 'services/migrate'

export default async (event, respond) => {
  let nextContinuationToken

  do {
    const { body } = await migrate(event, nextContinuationToken)
    nextContinuationToken = JSON.parse(body)['nextContinuationToken']
  } while (nextContinuationToken)

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'partial success',
      isTruncated: false
    })
  }
}
