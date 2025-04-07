export const ContributionTracker = () => {
    const [contributions, setContributions] = useState({});
    
    const recordContribution = (member) => {
      setContributions(prev => ({
        ...prev,
        [member]: (prev[member] || 0) + 1
      }));
    };
  
    return (
      <div className="simple-card">
        <h3>🎫 Contributions</h3>
        {chama.members?.map(member => (
          <div key={member.name}>
            {member.name}: {contributions[member.name] || 0}
            <button onClick={() => recordContribution(member.name)}>
              +
            </button>
          </div>
        ))}
      </div>
    );
  };
