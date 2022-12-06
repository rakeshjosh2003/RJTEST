import { render } from '@testing-library/react'
import { ManageUsersPage } from '../ManageUsersPage'

describe('ManageUsersPage', () => {
    it('renders correctly', async () => {
        const { findByText, container } = render(<ManageUsersPage />)
        const heading = await findByText('User List')
        expect(heading).toBeTruthy()
        expect(container).toMatchSnapshot()
    })
})
