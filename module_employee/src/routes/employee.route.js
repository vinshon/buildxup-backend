const express = require('express');
const router = express.Router();
const handler = require('../handlers/employee.handler');
const { authMiddleware } = require("../../../middleware/auth.middleware");

// Register authentication middleware for all employee routes
router.use(authMiddleware);

router.post('/', handler.createEmployeeHandler);
router.get('/', handler.getEmployeesHandler);
router.get('/:employeeId', handler.getEmployeeByIdHandler);
router.put('/:employeeId', handler.updateEmployeeHandler);
router.delete('/:employeeId', handler.softDeleteEmployeeHandler);

module.exports = router; 