import "./Features.css";

const Features = () => {
  return (
    <div className="container text-center my-5" style={{ color: "#4E4528" }}>
      <section className="mb-5">
        <h2 className="mb-4">What We Offer</h2>
        <div className="row">
          <div className="col-md-4">
            <h3>🔄 Merry-Go-Round Chama</h3>
            <p>Participate in a rotating savings system where members contribute and receive payouts in turns.</p>
          </div>
          <div className="col-md-4">
            <h3>📈 Investment Chama</h3>
            <p>Grow wealth together by investing in businesses, assets, and profitable ventures.</p>
          </div>
          <div className="col-md-4">
            <h3>⚖️ Hybrid Chama</h3>
            <p>Enjoy the best of both worlds—merry-go-round savings and long-term investments.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4">Our Features</h2>
        <div className="row">
          <div className="col-md-4">
            <h3>📢 Contributions</h3>
            <p>Make secure contributions to your chama with ease.</p>
          </div>
          <div className="col-md-4">
            <h3>💰 Loans</h3>
            <p>Request and manage loans with transparency.</p>
          </div>
          <div className="col-md-4">
            <h3>💳 Withdrawals</h3>
            <p>Withdraw funds conveniently when approved.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
