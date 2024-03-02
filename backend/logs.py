import logging

login_logger = logging.getLogger('login')
update_logger = logging.getLogger('update')
create_logger = logging.getLogger('create')
suspensions_logger = logging.getLogger('suspensions')

formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')

login_handler = logging.FileHandler('login.log').setFormatter(formatter) 
update_handler = logging.FileHandler('update.log').setFormatter(formatter) 
create_handler = logging.FileHandler('create.log').setFormatter(formatter) 
suspensions_handler = logging.FileHandler('suspensions.log').setFormatter(formatter)


login_logger.addHandler(login_handler)
update_logger.addHandler(update_handler)
create_logger.addHandler(create_handler)
suspensions_logger.addHandler(suspensions_handler)
