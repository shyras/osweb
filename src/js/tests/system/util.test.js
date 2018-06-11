const util = require('../../osweb/system/util')
util.getHost = () => 'http://localhost'

const parseUrl = util.parseUrl

describe('parseUrl', () => {
  it('Should return an URL Object when supplied with a valid URL', () => {
    expect(parseUrl('http://osweb.nl')).toBe(true)
    expect(parseUrl('/test-osexp/capybaras.osexp')).toBe(true)
  })

  it('Should return false when supplied with an invalid URL', () => {
    expect(parseUrl('abc')).toBe(false)
    expect(parseUrl('http://')).toBe(false)
  })
})
