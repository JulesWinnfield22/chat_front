import {useContext} from 'react'
import {FormContext} from '@/components/Form/Form'

function useForm() {
  const context = useContext(FormContext)
  return context
}

export default useForm