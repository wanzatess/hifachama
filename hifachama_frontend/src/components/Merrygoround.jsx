export const MemberRotation = ({ members }) => {
    return (
      <div className="simple-card">
        <h3>🎯 Next in Rotation</h3>
        <ul>
          {members.map((member, index) => (
            <li key={index}>
              {member.name} {index === 0 && "(Current)"}
            </li>
          ))}
        </ul>
        <button className="simple-button">Mark Complete</button>
      </div>
    );
  };
