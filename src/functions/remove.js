import api from 'services/api'

export default async (event) => {
  if (event.Records.length) {
    await event.Records.reduce(
      async (previousJob, file) => {
        await previousJob
        const { key } = file.s3.object
        const projectIdentifier = key.split('/')[ 1 ]
        try {
          return await api.call('delete', `/projects/${ projectIdentifier }/files/${ key }`)
        } catch (error) {
          console.error(error)
        }
       }, Promise.resolve()
     )
   } else {
     return { statusCode: 500, body: event }
  }
}
