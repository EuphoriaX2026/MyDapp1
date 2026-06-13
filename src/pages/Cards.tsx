import { AppIcon } from '../components/icons/AppIcon';
import { useState } from 'react'


export const Cards = () => {
  const [cards] = useState([
    { id: 1, type: 'card-classic-s1', balance: '$12', package: 'Classic', group: '1 Star', price: '$10' },
    { id: 2, type: 'card-vip-s1', balance: '$36', package: 'VIP', group: '1 Star', price: '$20' },
    { id: 3, type: 'card-classic-s2', balance: '$60', package: 'Classic', group: '2 Star', price: '$30' },
    { id: 4, type: 'card-vip-s2', balance: '$120', package: 'VIP', group: '2 Star', price: '$60' },
    { id: 5, type: 'card-classic-s3', balance: '$450', package: 'Classic', group: '3 Star', price: '$50' },
    { id: 6, type: 'card-vip-s3', balance: '$750', package: 'VIP', group: '3 Star', price: '$100' },
    { id: 7, type: 'card-classic-s4', balance: '$1,500', package: 'Classic', group: '4 Star', price: '$100' },
    { id: 8, type: 'card-vip-s4', balance: '$30', package: 'VIP', group: '4 Star', price: '$200' },
    { id: 9, type: 'card-classic-s5', balance: '$90', package: 'Classic', group: '5 Star', price: '$300' },
    { id: 10, type: 'card-vip-s5', balance: '$150', package: 'VIP', group: '5 Star', price: '$600' },
    { id: 11, type: 'card-classic-s6', balance: '$300', package: 'Classic', group: '6 Star', price: '$500' },
    { id: 12, type: 'card-vip-s6', balance: '$1,080', package: 'VIP', group: '6 Star', price: '$1000' },
    { id: 13, type: 'card-classic-s7', balance: '$1,800', package: 'Classic', group: '7 Star', price: '$1000' },
    { id: 14, type: 'card-vip-s7', balance: '$4,000', package: 'VIP', group: '7 Star', price: '$2000' }
  ])

  return (
    <>
      <div className="appHeader">
        <div className="left" />
        <div className="pageTitle">Cards</div>
        <div className="right" />
      </div>
      <div className="section mt-2 finapp-secondary-page">
        {cards.map((card) => (
          <div key={card.id} className={`card-block mb-2 ${card.type}`}>
            <div className="card-main">
              <div className="card-button dropdown">
                <button type="button" className="btn btn-link btn-icon" data-bs-toggle="dropdown">
                  <AppIcon icon="lucide:ellipsis" />
                </button>
                <div className="dropdown-menu dropdown-menu-end">
                  <a className="dropdown-item" href="#">
                    <AppIcon icon="lucide:pencil" />Edit
                  </a>
                  <a className="dropdown-item" href="#">
                    <AppIcon icon="lucide:x" />Remove
                  </a>
                  <a className="dropdown-item" href="#">
                    <AppIcon icon="lucide:circle-arrow-up" />Upgrade
                  </a>
                </div>
              </div>
              <div className="balance">
                <span className="label">CREDIT</span>
                <h1 className="title">{card.balance}</h1>
              </div>
              <div className="in">
                <div className="card-number">
                  <span className="label">PACKAGE</span>{card.package}
                </div>
                <div className="bottom">
                  <div className="card-expiry">
                    <span className="label">GROUP</span>{card.group}
                  </div>
                  <div className="card-ccv">
                    <span className="label">PRICE</span>{card.price}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Card Modal */}
      <div className="modal fade action-sheet" id="addCardActionSheet" tabIndex={-1} role="dialog">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add a Card</h5>
            </div>
            <div className="modal-body">
              <div className="action-sheet-content">
                <form>
                  <div className="form-group basic">
                    <div className="input-wrapper">
                      <label className="label" htmlFor="cardnumber1">Card Number</label>
                      <input type="number" id="cardnumber1" className="form-control" placeholder="Enter Card Number" />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-6">
                      <div className="form-group basic">
                        <div className="input-wrapper">
                          <label className="label" htmlFor="expiry1">Expiry Date</label>
                          <input type="text" id="expiry1" className="form-control" placeholder="MM/YY" />
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="form-group basic">
                        <div className="input-wrapper">
                          <label className="label" htmlFor="ccv1">CCV</label>
                          <input type="number" id="ccv1" className="form-control" placeholder="123" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="form-group basic mt-2">
                    <button type="button" className="btn btn-primary btn-block btn-lg" data-bs-dismiss="modal">
                      Add
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}