import requests
import base64
from decouple import config
from datetime import datetime

CONSUMER_KEY = "P2AGNjnYCmfBDeIrhJoL2MHV3bCsm0q0l0toXGhinihwBy9c"
CONSUMER_SECRET = "GZg78T0GOKU3BbOH4tm4WfRVG7aEYY15Qf7AyYaRY5WbIFdGga2XdClHTshNiGVG"

def get_mpesa_oauth_token():
    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"

    # Encode credentials
    credentials = f"{CONSUMER_KEY}:{CONSUMER_SECRET}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()

    headers = {
        "Authorization": f"Basic {encoded_credentials}"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  # Raises an error if response is not 200
        return response.json().get("access_token")
    except requests.exceptions.RequestException as e:
        print(f"Error fetching M-Pesa token: {e}")
        return None


def stk_push_request(phone_number, amount):
    """Initiate STK Push request to Safaricom M-Pesa API."""
    access_token = get_mpesa_oauth_token()
    if not access_token:
        return {"error": "Failed to get OAuth token"}

    url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"

    shortcode = config('MPESA_SHORTCODE')
    passkey = config('MPESA_PASSKEY')
    
    # Generate Timestamp
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")

    # Encode Business Shortcode + Passkey + Timestamp
    password = base64.b64encode(f"{shortcode}{passkey}{timestamp}".encode()).decode()

    payload = {
        "BusinessShortCode": shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone_number,
        "PartyB": shortcode,
        "PhoneNumber": phone_number,
        "CallBackURL": config('MPESA_CALLBACK_URL'),
        "AccountReference": "HifaChama",
        "TransactionDesc": "Chama Contribution"
    }

    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    
    response = requests.post(url, json=payload, headers=headers)
    return response.json()  # Return Safaricom response
def register_c2b_urls():
    """Register C2B URLs with Safaricom."""
    access_token = get_mpesa_oauth_token()
    if not access_token:
        return {"error": "Failed to get OAuth token"}

    url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl"

    payload = {
        "ShortCode": config('MPESA_SHORTCODE'),
        "ResponseType": "Completed",
        "ConfirmationURL": f"{config('MPESA_CALLBACK_URL')}/c2b/confirmation/",
        "ValidationURL": f"{config('MPESA_CALLBACK_URL')}/c2b/validation/"
    }

    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    
    response = requests.post(url, json=payload, headers=headers)
    return response.json()
def process_payment(amount, phone_number):
    # Dummy function for now
    return f"Processing payment of {amount} to {phone_number}"

