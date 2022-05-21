import { useState, memo} from 'react'
import useForm from '@/components/Form/useForm'

function TextInput() {
  const[value, setValue] = useState('')
  const[errorValue, setErrorValue] = useState('')
  
  function View({ name, placeholder, type = 'text' }) {
    const { FormInputContainer, onInput } = useForm()
    return (
      <FormInputContainer error={errorValue}>
        <input value={value} className='form-input' type={type} onChange={onInput(setValue, setErrorValue)} placeholder={placeholder} name={name} />
      </FormInputContainer>
    )    
  }

  return [
    View,
    {
      value,
      setValue,
      errorValue,
      setErrorValue
    }
  ]
}

export default TextInput