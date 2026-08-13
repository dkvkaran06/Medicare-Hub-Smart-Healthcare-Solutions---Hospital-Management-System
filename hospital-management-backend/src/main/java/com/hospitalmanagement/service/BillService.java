package com.hospitalmanagement.service;

import java.util.List;

import com.hospitalmanagement.entity.Bill;

public interface BillService {
    Bill createBill(Bill bill);

    Bill getBillById(Long id);

    List<Bill> getAllBills();

    Bill updateBill(Long id, Bill bill);

    void deleteBill(Long id);
}
