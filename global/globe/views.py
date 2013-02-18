from django.shortcuts import render_to_response
from django.template import RequestContext


def home(request, page=1):
    variables = RequestContext(request, {})
    return render_to_response('base.html', variables)
