import { createFileRoute } from '@tanstack/react-router'
import { RsvpPage } from '@/pages/RsvpPage'

export const Route = createFileRoute('/rsvp/$id')({
  component: RsvpRoute,
})

function RsvpRoute() {
  const { id } = Route.useParams()
  return <RsvpPage id={id} />
}
