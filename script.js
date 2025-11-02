// ------------------ DOM References ------------------
const form = document.getElementById("registrationForm");
const fullname = document.getElementById("fullname");
const email = document.getElementById("email");
const password = document.getElementById("password");
const phone = document.getElementById("phone");
const dob = document.getElementById("dob");
const genderRadios = document.getElementsByName("gender");
const successMsg = document.getElementById("success");

// ------------------ Regex Patterns ------------------
const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
const passPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
const phonePattern = /^[0-9]{10}$/;

// ------------------ Utility Functions ------------------
function setError(inputElem, message) {
  const group = inputElem.parentElement;
  const err = group.querySelector(".error");
  if (err) err.textContent = message;
}

function clearError(inputElem) {
  const group = inputElem.parentElement;
  const err = group.querySelector(".error");
  if (err) err.textContent = "";
}

// ------------------ Real-time Validation ------------------
fullname.addEventListener("input", () => {
  fullname.value.trim().length < 3
    ? setError(fullname, "Full name must be at least 3 characters")
    : clearError(fullname);
});

email.addEventListener("input", () => {
  !email.value.match(emailPattern)
    ? setError(email, "Enter a valid email address")
    : clearError(email);
});

password.addEventListener("input", () => {
  !password.value.match(passPattern)
    ? setError(password, "Password must be 6+ chars, contain uppercase, lowercase & number")
    : clearError(password);
});

phone.addEventListener("input", () => {
  !phone.value.match(phonePattern)
    ? setError(phone, "Enter a valid 10-digit phone number")
    : clearError(phone);
});

dob.addEventListener("change", () => {
  !dob.value ? setError(dob, "Select your date of birth") : clearError(dob);
});

genderRadios.forEach(radio => {
  radio.addEventListener("change", () => {
    const group = document.querySelector(".gender-options").parentElement;
    const err = group.querySelector(".error");
    if (err) err.textContent = "";
  });
});

// ------------------ Form Submission ------------------
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  let valid = true;

  // ------------------ Validation ------------------
  if (fullname.value.trim().length < 3) { setError(fullname, "Full name must be at least 3 characters"); valid = false; } else clearError(fullname);
  if (!email.value.match(emailPattern)) { setError(email, "Enter a valid email address"); valid = false; } else clearError(email);
  if (!password.value.match(passPattern)) { setError(password, "Password must be 6+ chars, contain uppercase, lowercase & number"); valid = false; } else clearError(password);
  if (!phone.value.match(phonePattern)) { setError(phone, "Enter a valid 10-digit phone number"); valid = false; } else clearError(phone);
  if (!dob.value) { setError(dob, "Select your date of birth"); valid = false; } else clearError(dob);

  const selectedGender = document.querySelector('input[name="gender"]:checked');
  const genderGroupElem = document.querySelector(".gender-options").parentElement;
  if (!selectedGender) {
    const err = genderGroupElem.querySelector(".error");
    if (err) err.textContent = "Select your gender";
    valid = false;
  } else {
    const err = genderGroupElem.querySelector(".error");
    if (err) err.textContent = "";
  }

  if (!valid) return; // stop submission if validation failed

  // ------------------ Prepare Payload ------------------
  const payload = {
    fullname: fullname.value.trim(),
    email: email.value.trim(),
    password: password.value,
    phone: phone.value.trim(),
    dob: dob.value,
    gender: selectedGender.value
  };

  // ------------------ Send to Backend ------------------
  try {
    const response = await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Server returned an error");

    // ------------------ Success ------------------
    successMsg.textContent = data.message || "✅ Registration Successful!";
    successMsg.style.color = "green";
    form.reset();
    document.querySelectorAll(".error").forEach(errElem => errElem.textContent = "");

  } catch (err) {
    successMsg.textContent = "❌ " + err.message;
    successMsg.style.color = "red";
    console.error(err);
  }
});