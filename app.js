const catalog = [
  { name: 'Fresh Milk · 1 L', price: 280 },
  { name: 'Basmati Rice · 1 kg', price: 390 },
  { name: 'Tea · 190 g', price: 540 },
  { name: 'Bread · Large', price: 170 },
];
const items = new Map();
const products = document.querySelector('#products');
const cart = document.querySelector('#cart');
const search = document.querySelector('#search');
const checkout = document.querySelector('#checkout');
const receipt = document.querySelector('#receipt');
const money = amount => 'PKR ' + amount.toLocaleString('en-PK');

function makeRow(label, detail, action, accessibleLabel, handler) {
  const row = document.createElement('div');
  row.className = 'row';
  const description = document.createElement('div');
  description.textContent = label;
  const amount = document.createElement('small');
  amount.textContent = detail;
  description.append(amount);
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = action;
  button.setAttribute('aria-label', accessibleLabel);
  button.addEventListener('click', handler);
  row.append(description, button);
  return row;
}

function renderProducts() {
  products.replaceChildren();
  for (const product of catalog) {
    if (!product.name.toLowerCase().includes(search.value.trim().toLowerCase())) continue;
    products.append(makeRow(product.name, money(product.price), 'Add', 'Add ' + product.name, () => {
      items.set(product, (items.get(product) ?? 0) + 1);
      receipt.textContent = '';
      renderCart();
    }));
  }
  if (!products.children.length) products.textContent = 'No matching products.';
}

function renderCart() {
  cart.replaceChildren();
  let total = 0;
  for (const [product, quantity] of items) {
    total += quantity * product.price;
    cart.append(makeRow(product.name, quantity + ' × ' + money(product.price), '−', 'Remove one ' + product.name, () => {
      if (quantity === 1) items.delete(product);
      else items.set(product, quantity - 1);
      renderCart();
      (cart.querySelector('button') ?? products.querySelector('button') ?? search).focus();
    }));
  }
  if (!items.size) cart.textContent = 'Your cart is empty.';
  document.querySelector('#total').textContent = money(total);
  checkout.disabled = items.size === 0;
  return total;
}

search.addEventListener('input', renderProducts);
checkout.addEventListener('click', () => {
  const total = renderCart();
  items.clear();
  renderCart();
  receipt.textContent = 'Sample sale completed for ' + money(total) + '.';
});

document.querySelector('#inquiry').addEventListener('submit', event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const shop = form.get('shop').trim();
  const contact = form.get('contact').trim();
  const status = document.querySelector('#request-status');
  if (!shop || !contact) {
    status.textContent = 'Enter your shop name and a contact email or phone number.';
    return;
  }
  const notes = form.get('message').trim() || 'Please share demo availability and pricing.';
  const subject = 'Salevix ONE POS demo request';
  const message = subject + '\n\nShop: ' + shop + '\nContact: ' + contact + '\n\n' + notes;
  const encodedMessage = encodeURIComponent(message);

  if (event.submitter?.value === 'email') {
    window.location.href = 'mailto:expsolhub@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodedMessage;
    status.textContent = 'Send your draft from your email app.';
  } else {
    const url = 'https://wa.me/923219536312?text=' + encodedMessage;
    window.open(url, '_blank', 'noopener,noreferrer');
    status.textContent = 'Send your draft from WhatsApp.';
  }
});

renderProducts();
renderCart();
