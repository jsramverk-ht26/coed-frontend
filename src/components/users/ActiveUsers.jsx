/**
 * ActiveUsers — panel som visar aktiva användare i filen
 * US-402: Visa aktiva användare
 *   - Visar alla användare som har filen öppen
 *   - Uppdateras i realtid vid connect/disconnect
 *   - Varje användare har en unik färg kopplad till sin cursor
 *   - Visar användarnamn och vilken fil varje användare har öppen
 */

export default function ActiveUsers({ users, currentUserId }) {
  if (!users || users.length === 0) return null

  return (
    <div className="active-users">
      <h3>Aktiva nu</h3>
      <ul>
        {users.map(({ user }) => (
          <li key={user.userId} className="active-user">
            {/* US-402: Unik färg per användare */}
            <span
              className="user-dot"
              style={{ backgroundColor: user.color }}
              title={user.username}
            />
            <span className="user-name">
              {user.username}
              {user.userId === currentUserId && ' (du)'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
