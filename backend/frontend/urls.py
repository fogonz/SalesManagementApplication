from django.urls import path
from .views import home_view, help_view, transaction

urlpatterns = [
	path('', home_view, name="home"),
	path('ayuda', help_view, name="help"),
	path('newtransaction', transaction, name="help")
]
