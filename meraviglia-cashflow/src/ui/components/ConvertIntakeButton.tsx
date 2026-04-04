import { useState } from "react"
import { toUserFacingErrorMessage } from "../../application/toUserFacingErrorMessage"

import { convertIntakeToWorkspace } from "../../application/intakeService"

type ConvertIntakeButtonProps = {
  intakeId: string
  onConverted: (workspace: { id: string; workspace_name: string }) => Promise<void> | void
}

function ConvertIntakeButton({ intakeId, onConverted }: ConvertIntakeButtonProps) {
  const [isConverting, setIsConverting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleConvert = async () => {
    setIsConverting(true)
    setErrorMessage(null)

    try {
      const { workspace } = await convertIntakeToWorkspace(intakeId)
      await onConverted({ id: workspace.id, workspace_name: workspace.workspace_name })
    } catch (error) {
      setErrorMessage(toUserFacingErrorMessage(error, "Unable to create workspace from this entry"))
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <>
      <button onClick={handleConvert} disabled={isConverting}>
        {isConverting ? "Creating workspace..." : "Qualify & create workspace"}
      </button>
      {errorMessage ? <p style={{ color: "crimson", margin: "4px 0 0" }}>{errorMessage}</p> : null}
    </>
  )
}

export default ConvertIntakeButton
