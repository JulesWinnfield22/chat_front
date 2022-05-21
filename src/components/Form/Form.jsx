import { forwardRef, createContext, useContext, memo } from 'react'

const FormContext = createContext()

export {FormContext}

const onInput = (cb, cbError) => (ev) => {
  cbError('')
  cb(ev.target.value)
}

const FormInputContainer = memo(({children, error, className}) => {
  return (
    <div className={`form-input-container ${className}`}>
      <label className={`${error ? 'border-red-500 error' : 'focus-within:border-sky-300 '} form-input-label`}>
        {
          children
        }
      </label>
      {
        error &&
        <p className="px-1 text-sm text-red-500 lowercase">{error}</p>
      }
    </div>
  )
})

const  Form = forwardRef(({ children }, ref) => {
  return (
    <FormContext.Provider value={{
      onInput,
      FormInputContainer
    }}>
      {
        onInput && FormInputContainer &&
        <form ref={ref} className='p-2 sm:p-3 shadow-md border-2 rounded-lg border-sky-300 flex flex-col gap-2'>
          {
            children
          }
        </form>
      }
    </FormContext.Provider>
  )
})

export default Form