import { isUrl } from '../../osweb/system/util'

describe('isUrl', () => {
  it('Should return true when supplied with a valid URL', () => {
    expect(isUrl('http://osweb.nl')).toBe(true)
    // expect(isUrl('/test-osexp/capybaras.osexp')).toBe(true)
  })

  it('Should return when supplied with an invalid URL', () => {
    expect(isUrl('abc')).toBe(false)
    expect(isUrl('http://')).toBe(false)
    expect(isUrl('http://test')).toBe(false)
  })
})
