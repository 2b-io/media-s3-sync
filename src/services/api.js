import ms from 'ms'
import request from 'superagent'
import config from 'infrastructure/config'

const call = async (method, path, body) => {
  const requestPath = `${ config.apiUrl }${ path }`

  const response = await request(method, requestPath)
    .timeout(ms('30s'))
    .set('content-type', 'application/json')
    .set('authorization', 'MEDIA_CDN app=s3-sync')
    .send(body)

  return response.body
}

export default {
  call
}
