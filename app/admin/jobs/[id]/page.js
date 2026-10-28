import { notFound } from 'next/navigation'
import JobForm from '@/components/JobForm'
import { getJob } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function EditJob({ params }) {
  const { id } = await params
  const job = await getJob(id)
  if (!job) notFound()
  return <JobForm job={job} />
}
