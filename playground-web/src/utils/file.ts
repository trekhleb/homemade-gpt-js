export const saveAsFile = (obj: Object, name: string) => {
  const jsonString = JSON.stringify(obj)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const link = document.createElement('a')
  link.download = `${name}.json`
  link.href = URL.createObjectURL(blob)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
