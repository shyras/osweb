import Transfer from '../../osweb/system/transfer'
import Runner from '../../osweb/system/runner'

const mockUpdateIntroScreen = jest.fn()
const mockUpdateProgressBar = jest.fn()
const mockAddMessage = jest.fn()
const mockAddError = jest.fn()
const mockPoolAdd = jest.fn()
const mockBuildFn = jest.fn()

jest.mock('../../osweb/system/runner', () => {
  return jest.fn().mockImplementation(() => {
    return {
      _screen: {
        _updateIntroScreen: mockUpdateIntroScreen,
        _updateProgressBar: mockUpdateProgressBar
      },
      _debugger: {
        addMessage: mockAddMessage,
        addError: mockAddError
      },
      _pool:{
        add: mockPoolAdd
      },
      _build: mockBuildFn,
    };
  });
});

const transfer = new Transfer(new Runner())

describe('_readSource', () => {
  beforeEach(() => {
    Runner.mockClear()
    mockUpdateIntroScreen.mockClear()
    mockUpdateProgressBar.mockClear()
    mockAddMessage.mockClear()
    mockAddError.mockClear()
    mockPoolAdd.mockClear()
    mockBuildFn.mockClear()
  })

  test('Should log an error if an invalid or no source is supplied', () => {
    const invalidParams = [null, true, 5, {}, [], new FileReader()]
    for (const param of invalidParams) {
      transfer._readSource(param)
    }
    expect(mockAddError).toHaveBeenCalledTimes(invalidParams.length)
  })
  test('Should update the status display', () => {
    transfer._readSource()
    expect(mockUpdateIntroScreen).toHaveBeenCalledTimes(1)
    expect(mockUpdateProgressBar.mock.calls[0][0]).toBe(-1)
  })
})
