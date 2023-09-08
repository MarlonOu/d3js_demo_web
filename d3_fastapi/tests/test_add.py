import allure


@allure.title("測試add值")
def test_add_Value():
    """
    值 正確
    """
    one, two = 1, 1
    assert one + two == 2
