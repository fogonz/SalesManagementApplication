from django.shortcuts import render

# Create your views here.
def home_view(request):
    return render(request, 'home.html')

def help_view(request):
    return render(request, 'help.html')

def transaction(request):
    return render(request, 'transaction.html')

def help_view(request):
    return render(request, 'help.html')