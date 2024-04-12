export async function main(event: { message: string; }) {
  return {
    message: `Received message ${event.message}`
  }
}