import { useState } from "react"
import { toUserFacingErrorMessage } from "../../application/toUserFacingErrorMessage"

import { convertIntakeToWorkspace } from "../../application/intakeService"

type ConvertIntakeButtonProps = {
  intakeId: string
  onConverted: () => Promise<void> | void
}

function ConvertIntakeButton({ intakeId, onConverted }: ConvertIntakeButtonProps) {
  const [isConverting, setIsConverting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleConvert = async () => {
    setIsConverting(true)
    setErrorMessage(null)

    try {
      await convertIntakeToWorkspace(intakeId)
      await onConverted()
    } catch (error) {
      setErrorMessage(toUserFacingErrorMessage(error, "Unable to convert intake"))
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <>
      <button onClick={handleConvert} disabled={isConverting}>
        {isConverting ? "Converting..." : "Convert to Workspace"}
      </button>
      {errorMessage ? <p style={{ color: "crimson", margin: "4px 0 0" }}>{errorMessage}</p> : null}
    </>
  )
}

export default ConvertIntakeButton
