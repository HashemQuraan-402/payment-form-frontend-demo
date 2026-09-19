const form = document.querySelector('#payment-form');
const cardNumber = document.querySelector('#card-number');
const expiry = document.querySelector('#expiry');
const cvc = document.querySelector('#cvc');
const status = document.querySelector('#form-status');

const digitsOnly = (value) => value.replace(/\D/g, '');

const setError = (input, message) => {
  const error = document.querySelector(`#${input.id}-error`);
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (error) {
    error.textContent = message;
  }
};

const passesLuhnCheck = (value) => {
  const digits = digitsOnly(value);
  let total = 0;
  let doubleDigit = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    total += digit;
    doubleDigit = !doubleDigit;
  }

  return digits.length >= 13 && digits.length <= 19 && total % 10 === 0;
};

cardNumber?.addEventListener('input', () => {
  const digits = digitsOnly(cardNumber.value).slice(0, 19);
  cardNumber.value = digits.replace(/(.{4})/g, '$1 ').trim();
  setError(cardNumber, '');
});

expiry?.addEventListener('input', () => {
  const digits = digitsOnly(expiry.value).slice(0, 4);
  expiry.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  setError(expiry, '');
});

cvc?.addEventListener('input', () => {
  cvc.value = digitsOnly(cvc.value).slice(0, 4);
  setError(cvc, '');
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!(form instanceof HTMLFormElement)) return;

  form.querySelectorAll('input').forEach((input) => setError(input, ''));
  let valid = true;

  const nameInput = document.querySelector('#cardholder-name');
  if (nameInput instanceof HTMLInputElement && nameInput.value.trim().length < 2) {
    setError(nameInput, 'Enter the name shown on the fictional test card.');
    valid = false;
  }

  if (cardNumber instanceof HTMLInputElement && !passesLuhnCheck(cardNumber.value)) {
    setError(cardNumber, 'Enter a valid fictional or approved test-card number.');
    valid = false;
  }

  if (expiry instanceof HTMLInputElement) {
    const match = expiry.value.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
    if (!match) {
      setError(expiry, 'Use a valid month in MM/YY format.');
      valid = false;
    } else {
      const month = Number(match[1]);
      const year = 2000 + Number(match[2]);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);
      if (endOfMonth < new Date()) {
        setError(expiry, 'Use a future test-card expiry date.');
        valid = false;
      }
    }
  }

  if (cvc instanceof HTMLInputElement && !/^\d{3,4}$/.test(cvc.value)) {
    setError(cvc, 'Enter 3 or 4 digits.');
    valid = false;
  }

  if (!form.checkValidity()) {
    valid = false;
    form.reportValidity();
  }

  if (!valid) {
    if (status) status.textContent = '';
    return;
  }

  if (status) {
    status.textContent = 'Demo validated locally. No payment was made and no data was sent or stored.';
  }
  form.reset();
});

