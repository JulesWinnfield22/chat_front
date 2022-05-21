import {useState, memo} from 'react'
import useForm from '@/components/Form/useForm'

function TwoHorizontalInputs() {
  const [firstValue, setFirstValue] = useState('')
  const [firstValueError, setFirstValueError] = useState('')
  const [secondValue, setSecondValue] = useState('')
  const [secondValueError, setSecondValueError] = useState('')
  // console.log(useForm)
  function View({ firstName, secondName, fPlaceholder, sPlaceholder }) {
    const {FormInputContainer, onInput} = useForm()
    return (
      <div className="flex justify-between gap-1 sm:gap-2 flex-1">
        <FormInputContainer error={firstValueError} className="w-[49%] sm:w-1/2">
          <input value={firstValue} onChange={onInput(setFirstValue, setFirstValueError)} className="form-input" placeholder={fPlaceholder} type="text" name={firstName} id="" />
        </FormInputContainer>
        <FormInputContainer error={secondValueError} className="w-[49%] sm:w-1/2">
          <input value={secondValue} onChange={onInput(setSecondValue, setSecondValueError)} className="form-input" placeholder={sPlaceholder} type="text" name={secondName} id="" />
        </FormInputContainer>
      </div>
    )
  }

  return [
    memo(View),
    {
      firstValue,
      setFirstValue,
      firstValueError,
      setFirstValueError,
      secondValue,
      setSecondValue,
      secondValueError,
      setSecondValueError
    }
  ]
}

export default TwoHorizontalInputs