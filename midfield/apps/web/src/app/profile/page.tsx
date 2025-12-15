import { getUserProfile } from './actions'
import { ProfileClient } from './ProfileClient'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
    const data = await getUserProfile()

    if (!data) {
        redirect('/auth')
    }

    return <ProfileClient initialData={data} />
}
