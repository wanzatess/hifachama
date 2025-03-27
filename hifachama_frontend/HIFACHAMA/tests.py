from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from datetime import datetime
from django.db import transaction, IntegrityError
from HIFACHAMA.models import Chama, ChamaMember, Transaction, Loan, Meeting, Notification
from django.db.models.signals import post_save
from HIFACHAMA.signals import contribution_notification
from unittest.mock import patch
from rest_framework.test import APITestCase
from HIFACHAMA.reports import generate_pdf_report, generate_excel_report
from HIFACHAMA.utils.mpesa import process_payment
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from rest_framework import status

User = get_user_model() 
class ChamaTestCase(TestCase):
    def setUp(self):
        # Create users for different roles
        self.chairperson_user = User.objects.create_user(username="chairperson", password="test123", email="chairperson@example.com")
        self.treasurer_user = User.objects.create_user(username="treasurer", password="test123", email="treasurer@example.com")
        self.secretary_user = User.objects.create_user(username="secretary", password="test123", email="secretary@example.com")
        self.member_user = User.objects.create_user(username="member", password="test123", email="member@example.com")
        self.admin_user = User.objects.create_user(username='admin', password='admin_password', email="admin@example.com")

        # Create a chama
        self.chama = Chama.objects.create(name="Test Chama", description="A test chama", admin=self.admin_user)

        # Create ChamaMembers with roles
        self.chama_member = ChamaMember.objects.create(name="Test Member", phone_number="1234567890", email="testmember@example.com", chama=self.chama, role='member', user=self.member_user)
        self.chairperson_member = ChamaMember.objects.create(name="Chairperson", phone_number="1234567891", email="chairperson_member@example.com", chama=self.chama, role='chairperson', user=self.chairperson_user)
        self.treasurer_member = ChamaMember.objects.create(name="Treasurer", phone_number="1234567892", email="treasurer_member@example.com", chama=self.chama, role='treasurer', user=self.treasurer_user)
        self.secretary_member = ChamaMember.objects.create(name="Secretary", phone_number="1234567893", email="secretary_member@example.com", chama=self.chama, role='secretary', user=self.secretary_user)
        self.meeting_time = timezone.now()
    # 1️⃣ Chairperson Tests
    def test_chairperson_can_create_and_delete_chama(self):
        new_chama = Chama.objects.create(name="New Chama", description="Another test chama", admin=self.admin_user)
        self.assertEqual(Chama.objects.count(), 2)

        new_chama.delete()
        self.assertEqual(Chama.objects.count(), 1)

    def test_chairperson_can_approve_loans(self):
        loan = Loan.objects.create(
            member=self.chama_member,
            chama=self.chama,
            amount=5000,
            status="pending"
        )
        self.assertEqual(Loan.objects.count(), 1)

        loan.status = "approved"  # Chairperson approves loan
        loan.save()
        self.assertEqual(Loan.objects.get(id=loan.id).status, "approved")

    # 2️⃣ Treasurer Tests
    def test_treasurer_can_approve_withdrawals(self):
        # Member requests withdrawal
        withdrawal = Transaction.objects.create(
            member=self.chama_member,
            chama=self.chama,
            amount=2000,
            transaction_type="withdrawal",
            status="pending"  # Initially pending approval
        )
        self.assertFalse(withdrawal.status == "approved")

        # Treasurer approves withdrawal
        withdrawal.status = "approved"
        withdrawal.save()
        self.assertEqual(Transaction.objects.get(id=withdrawal.id).status, "approved")

    def test_treasurer_can_approve_contributions(self):
        contribution = Transaction.objects.create(
            member=self.chama_member,
            chama=self.chama,
            amount=1500,
            transaction_type="contribution",
            status="pending"
        )
        self.assertFalse(contribution.status == "approved")

        contribution.status = "approved"  # Treasurer approves contribution
        contribution.save()
        self.assertEqual(Transaction.objects.get(id=contribution.id).status, "approved")

    # 3️⃣ Secretary Tests
    def test_secretary_can_schedule_meetings(self):
    # Convert the naive datetime to a timezone-aware datetime
        meeting_date = timezone.make_aware(datetime(2025, 3, 1, 10, 0, 0))

    # Create a meeting with the appropriate fields based on the model definition
        meeting = Meeting.objects.create(
        chama=self.chama,  # Ensure that this 'chama' is already created in the setUp method
        location="Meeting Room 1",  # Define the location for the meeting
        agenda="Discuss future investments",  # Define the agenda for the meeting
        date=meeting_date  # Set the timezone-aware date and time for the meeting
    )
    
    # Ensure the meeting was created successfully
        self.assertEqual(Meeting.objects.count(), 1)

    def test_secretary_can_send_notifications(self):
        # Assuming Notification model has a 'message' field and related user
        notification = Notification.objects.create(
            user=self.chama_member.user,  # Make sure 'chama_member' exists from setup
            message="Reminder: Attend the next meeting on Friday."
        )
        self.assertEqual(Notification.objects.count(), 1)


    # 4️⃣ Member Tests
    def test_member_can_view_chama_details(self):
        chama = Chama.objects.get(name="Test Chama")
        self.assertEqual(chama.description, "A test chama")

    def test_member_can_request_loan(self):
        unique_chama_name = f"Test Chama {self._testMethodName}"  # Unique name per test case
        self.chama = Chama.objects.create(name=unique_chama_name, description="Test description", admin=self.admin_user)
        new_member_user = User.objects.create_user(username="new_member", password="test123", email="new_member@example.com")
        self.chama_member = ChamaMember.objects.create(name="Test Member", phone_number="123456789", email="member@example.com", role="member", chama=self.chama, user=new_member_user)
        loan = Loan.objects.create(
            member=self.chama_member,
            chama=self.chama,
            amount=3000,
            status="pending"
        )
        self.assertEqual(Loan.objects.count(), 1)
        self.assertEqual(loan.status, "pending")
        self.assertEqual(loan.chama.name, unique_chama_name)
    def tearDown(self):
        # Clean up if necessary
        Chama.objects.all().delete()
        ChamaMember.objects.all().delete()
        Loan.objects.all().delete()

    def test_member_can_request_withdrawal(self):
        withdrawal = Transaction.objects.create(
            member=self.chama_member,
            chama=self.chama,
            amount=1000,
            transaction_type="withdrawal",
            status="pending"  # Pending approval by treasurer
        )
        self.assertEqual(withdrawal.status, "pending")

    def test_member_can_make_contribution(self):
        transaction = Transaction.objects.create(
            member=self.chama_member,
            chama=self.chama,
            amount=1500,
            transaction_type="contribution",
            status="pending"  # Pending approval by treasurer
        )
        self.assertEqual(transaction.status, "pending")
class SignalTestCase(TestCase):
    def setUp(self):
        # Create necessary related objects
        self.user = User.objects.create_user(username="testmember", password="password123", email="test@example.com")
        self.chama = Chama.objects.create(name="Test Chama", description="A test chama", admin=self.user)

        # Create a ChamaMember with the required fields
        self.chama_member = ChamaMember.objects.create(
            name="Test Member",
            phone_number="123456789",
            email="testmember@example.com",
            role="member",
            user=self.user,  # ✅ Required field
            chama=self.chama  # ✅ Required ForeignKey
        )


    def test_contribution_notification_signal(self):
        with patch("HIFACHAMA.signals.send_push_notification") as mock_push, \
            patch("HIFACHAMA.signals.send_email_notification") as mock_email:
        
            transaction = Transaction.objects.create(
            member=self.chama_member,
            chama=self.chama,  # Ensure chama is provided
            amount=2000,
            transaction_type="contribution",
            status="approved"
        )
        
        # Manually trigger the signal for testing
        post_save.send(sender=Transaction, instance=transaction, created=True)
        
        # Assert that both notifications were triggered exactly once
        mock_email.assert_called_once()
        mock_push.assert_called_once()

class LoginTestCase(APITestCase):
    def setUp(self):
        # Create a test user
        self.username = "testuser"
        self.password = "test123"
        self.user = User.objects.create_user(username=self.username, password=self.password)
        self.token = Token.objects.create(user=self.user)
        # Login endpoint
        self.login_url = "/api/token/"

    def test_login_success(self):
        # Make the login request
        login_data = {"username": self.username, "password": self.password}
        response = self.client.post(self.login_url, login_data, format="json")

        # Debug: Print the response status and data
        print("Response Status:", response.status_code)
        print("Response Data:", response.content.decode())

        # Assert the response status code
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify the token is returned in the response
        self.assertIn("token", response.json())


class TransactionHistoryTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpassword")
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")  # Ensure authentication

    def test_get_transaction_history(self):
        response = self.client.get('/api/transactions/')  # Replace with actual endpoint
        self.assertEqual(response.status_code, 200)  # Now expects 200 if authentication works
class ReportTestCase(TestCase):
    def test_generate_pdf_report(self):
        response = generate_pdf_report(None)
        self.assertEqual(response.status_code, 200)

    def test_generate_excel_report(self):
        response = generate_excel_report(None)
        self.assertEqual(response.status_code, 200)
class MpesaTestCase(TestCase):
    @patch("HIFACHAMA.utils.mpesa.requests.post")
    def test_process_payment_success(self, mock_post):
        mock_post.return_value.status_code = 200
        response = process_payment(1000, "254712345678")
        self.assertTrue(response)
from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from datetime import datetime
from django.db import transaction, IntegrityError
from HIFACHAMA.models import Chama, ChamaMember, Transaction, Loan, Meeting, Notification
from django.db.models.signals import post_save
from HIFACHAMA.signals import contribution_notification
from unittest.mock import patch
from rest_framework.test import APITestCase
from HIFACHAMA.reports import generate_pdf_report, generate_excel_report
from HIFACHAMA.utils.mpesa import process_payment
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from rest_framework import status

User = get_user_model() 
class ChamaTestCase(TestCase):
    def setUp(self):
        # Create users for different roles
        self.chairperson_user = User.objects.create_user(username="chairperson", password="test123", email="chairperson@example.com")
        self.treasurer_user = User.objects.create_user(username="treasurer", password="test123", email="treasurer@example.com")
        self.secretary_user = User.objects.create_user(username="secretary", password="test123", email="secretary@example.com")
        self.member_user = User.objects.create_user(username="member", password="test123", email="member@example.com")
        self.admin_user = User.objects.create_user(username='admin', password='admin_password', email="admin@example.com")

        # Create a chama
        self.chama = Chama.objects.create(name="Test Chama", description="A test chama", admin=self.admin_user)

        # Create ChamaMembers with roles
        self.chama_member = ChamaMember.objects.create(name="Test Member", phone_number="1234567890", email="testmember@example.com", chama=self.chama, role='member', user=self.member_user)
        self.chairperson_member = ChamaMember.objects.create(name="Chairperson", phone_number="1234567891", email="chairperson_member@example.com", chama=self.chama, role='chairperson', user=self.chairperson_user)
        self.treasurer_member = ChamaMember.objects.create(name="Treasurer", phone_number="1234567892", email="treasurer_member@example.com", chama=self.chama, role='treasurer', user=self.treasurer_user)
        self.secretary_member = ChamaMember.objects.create(name="Secretary", phone_number="1234567893", email="secretary_member@example.com", chama=self.chama, role='secretary', user=self.secretary_user)
        self.meeting_time = timezone.now()
    # 1️⃣ Chairperson Tests
    def test_chairperson_can_create_and_delete_chama(self):
        new_chama = Chama.objects.create(name="New Chama", description="Another test chama", admin=self.admin_user)
        self.assertEqual(Chama.objects.count(), 2)

        new_chama.delete()
        self.assertEqual(Chama.objects.count(), 1)

    def test_chairperson_can_approve_loans(self):
        loan = Loan.objects.create(
            member=self.chama_member,
            chama=self.chama,
            amount=5000,
            status="pending"
        )
        self.assertEqual(Loan.objects.count(), 1)

        loan.status = "approved"  # Chairperson approves loan
        loan.save()
        self.assertEqual(Loan.objects.get(id=loan.id).status, "approved")

    # 2️⃣ Treasurer Tests
    def test_treasurer_can_approve_withdrawals(self):
        # Member requests withdrawal
        withdrawal = Transaction.objects.create(
            member=self.chama_member,
            chama=self.chama,
            amount=2000,
            transaction_type="withdrawal",
            status="pending"  # Initially pending approval
        )
        self.assertFalse(withdrawal.status == "approved")

        # Treasurer approves withdrawal
        withdrawal.status = "approved"
        withdrawal.save()
        self.assertEqual(Transaction.objects.get(id=withdrawal.id).status, "approved")

    def test_treasurer_can_approve_contributions(self):
        contribution = Transaction.objects.create(
            member=self.chama_member,
            chama=self.chama,
            amount=1500,
            transaction_type="contribution",
            status="pending"
        )
        self.assertFalse(contribution.status == "approved")

        contribution.status = "approved"  # Treasurer approves contribution
        contribution.save()
        self.assertEqual(Transaction.objects.get(id=contribution.id).status, "approved")

    # 3️⃣ Secretary Tests
    def test_secretary_can_schedule_meetings(self):
    # Convert the naive datetime to a timezone-aware datetime
        meeting_date = timezone.make_aware(datetime(2025, 3, 1, 10, 0, 0))

    # Create a meeting with the appropriate fields based on the model definition
        meeting = Meeting.objects.create(
        chama=self.chama,  # Ensure that this 'chama' is already created in the setUp method
        location="Meeting Room 1",  # Define the location for the meeting
        agenda="Discuss future investments",  # Define the agenda for the meeting
        date=meeting_date  # Set the timezone-aware date and time for the meeting
    )
    
    # Ensure the meeting was created successfully
        self.assertEqual(Meeting.objects.count(), 1)

    def test_secretary_can_send_notifications(self):
        # Assuming Notification model has a 'message' field and related user
        notification = Notification.objects.create(
            user=self.chama_member.user,  # Make sure 'chama_member' exists from setup
            message="Reminder: Attend the next meeting on Friday."
        )
        self.assertEqual(Notification.objects.count(), 1)


    # 4️⃣ Member Tests
    def test_member_can_view_chama_details(self):
        chama = Chama.objects.get(name="Test Chama")
        self.assertEqual(chama.description, "A test chama")

    def test_member_can_request_loan(self):
        unique_chama_name = f"Test Chama {self._testMethodName}"  # Unique name per test case
        self.chama = Chama.objects.create(name=unique_chama_name, description="Test description", admin=self.admin_user)
        new_member_user = User.objects.create_user(username="new_member", password="test123", email="new_member@example.com")
        self.chama_member = ChamaMember.objects.create(name="Test Member", phone_number="123456789", email="member@example.com", role="member", chama=self.chama, user=new_member_user)
        loan = Loan.objects.create(
            member=self.chama_member,
            chama=self.chama,
            amount=3000,
            status="pending"
        )
        self.assertEqual(Loan.objects.count(), 1)
        self.assertEqual(loan.status, "pending")
        self.assertEqual(loan.chama.name, unique_chama_name)
    def tearDown(self):
        # Clean up if necessary
        Chama.objects.all().delete()
        ChamaMember.objects.all().delete()
        Loan.objects.all().delete()

    def test_member_can_request_withdrawal(self):
        withdrawal = Transaction.objects.create(
            member=self.chama_member,
            chama=self.chama,
            amount=1000,
            transaction_type="withdrawal",
            status="pending"  # Pending approval by treasurer
        )
        self.assertEqual(withdrawal.status, "pending")

    def test_member_can_make_contribution(self):
        transaction = Transaction.objects.create(
            member=self.chama_member,
            chama=self.chama,
            amount=1500,
            transaction_type="contribution",
            status="pending"  # Pending approval by treasurer
        )
        self.assertEqual(transaction.status, "pending")
class SignalTestCase(TestCase):
    def setUp(self):
        # Create necessary related objects
        self.user = User.objects.create_user(username="testmember", password="password123", email="test@example.com")
        self.chama = Chama.objects.create(name="Test Chama", description="A test chama", admin=self.user)

        # Create a ChamaMember with the required fields
        self.chama_member = ChamaMember.objects.create(
            name="Test Member",
            phone_number="123456789",
            email="testmember@example.com",
            role="member",
            user=self.user,  # ✅ Required field
            chama=self.chama  # ✅ Required ForeignKey
        )


    def test_contribution_notification_signal(self):
        with patch("HIFACHAMA.signals.send_push_notification") as mock_push, \
            patch("HIFACHAMA.signals.send_email_notification") as mock_email:
        
            transaction = Transaction.objects.create(
            member=self.chama_member,
            chama=self.chama,  # Ensure chama is provided
            amount=2000,
            transaction_type="contribution",
            status="approved"
        )
        
        # Manually trigger the signal for testing
        post_save.send(sender=Transaction, instance=transaction, created=True)
        
        # Assert that both notifications were triggered exactly once
        mock_email.assert_called_once()
        mock_push.assert_called_once()

class LoginTestCase(APITestCase):
    def setUp(self):
        # Create a test user
        self.username = "testuser"
        self.password = "test123"
        self.user = User.objects.create_user(username=self.username, password=self.password)
        self.token = Token.objects.create(user=self.user)
        # Login endpoint
        self.login_url = "/api/token/"

    def test_login_success(self):
        # Make the login request
        login_data = {"username": self.username, "password": self.password}
        response = self.client.post(self.login_url, login_data, format="json")

        # Debug: Print the response status and data
        print("Response Status:", response.status_code)
        print("Response Data:", response.content.decode())

        # Assert the response status code
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify the token is returned in the response
        self.assertIn("token", response.json())


class TransactionHistoryTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpassword")
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")  # Ensure authentication

    def test_get_transaction_history(self):
        response = self.client.get('/api/transactions/')  # Replace with actual endpoint
        self.assertEqual(response.status_code, 200)  # Now expects 200 if authentication works
class ReportTestCase(TestCase):
    def test_generate_pdf_report(self):
        response = generate_pdf_report(None)
        self.assertEqual(response.status_code, 200)

    def test_generate_excel_report(self):
        response = generate_excel_report(None)
        self.assertEqual(response.status_code, 200)
class MpesaTestCase(TestCase):
    @patch("HIFACHAMA.utils.mpesa.requests.post")
    def test_process_payment_success(self, mock_post):
        mock_post.return_value.status_code = 200
        response = process_payment(1000, "254712345678")
        self.assertTrue(response)
