from rest_framework.pagination import PageNumberPagination

class StandardResultsPagination(PageNumberPagination):
    page_size = 50  # Default items per page
    page_size_query_param = 'page_size'  # Allow client to override
    max_page_size = 50  # Prevent overload
