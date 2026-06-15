import express from 'express';
import  {singleProperty}  from '../Controllers/singlePropertyController.js'

const router = express.Router()


router.post('/:id', singleProperty)

export default router;
