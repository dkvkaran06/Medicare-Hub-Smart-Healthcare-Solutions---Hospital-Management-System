package com.hospitalmanagement.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.hospitalmanagement.entity.Bill;
import com.hospitalmanagement.exception.ResourceNotFoundException;
import com.hospitalmanagement.repository.BillRepository;
import com.hospitalmanagement.service.BillService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BillServiceImpl implements BillService {

    private final BillRepository billRepository;

    @Override
    public Bill createBill(Bill bill) {
        return billRepository.save(bill);
    }

    @Override
    public Bill getBillById(Long id) {
        return billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + id));
    }

    @Override
    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }

    @Override
    public Bill updateBill(Long id, Bill bill) {
        Bill existingBill = getBillById(id);
        existingBill.setAmount(bill.getAmount());
        existingBill.setBillDate(bill.getBillDate());
        existingBill.setPaymentStatus(bill.getPaymentStatus());
        existingBill.setPatient(bill.getPatient());
        existingBill.setAppointment(bill.getAppointment());
        return billRepository.save(existingBill);
    }

    @Override
    public void deleteBill(Long id) {
        Bill existingBill = getBillById(id);
        billRepository.delete(existingBill);
    }
}
