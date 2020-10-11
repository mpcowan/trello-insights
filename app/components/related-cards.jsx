import React from 'react';

class RelatedCards extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  componentDidMount() {
    this.loadEmbeddedCards();
  }

  componentDidUpdate() {
    this.loadEmbeddedCards();
  }

  loadEmbeddedCards() {
    const el = this.ref.current;
    if (el) {
      el.innerHTML = '';
      const { idCards, compact } = this.props;
      (idCards || []).forEach((id) => {
        window.TrelloCards.create(id, el, { compact });
      });
    }
  }

  render() {
    return <div className="horizontal-scroll" ref={this.ref} />;
  }
}

export default RelatedCards;
