package BudgetCreater;
// Title: budgetAlgo.java
// Author: Nathan Tamari
// contains Algorithms for the execution of budgetDriver
// Enter current income, expected income growth, monthly expenses (which are assumed to stay
// the same), principal, and eventual goal of final amount
// input data including goal in dollars, outputs how many years it wil take to achieve

import java.awt.*;
import java.util.ArrayList;
import java.awt.event.*;
import javax.swing.*;
import java.awt.Color;
import java.awt.Font;

@SuppressWarnings("serial")
public class budgetAlgo extends JPanel{
	// variable creation
	//years, income, monthly, principal, goal, incomeTotal, stock;
	private JButton calculate, incomeB, monthlyB, goalAmountB, principalB, incomeTextB, stockB, zero, one, two, three, four, five,
	six, seven, eight, nine, delete, clearAll;
	private String changeValue;
	private ArrayList<Integer> incomeGrowthArray, goalAmountArray, principalArray, incomeArray, stockGrowthArray,
	monthlyArray;
	private int monthlyInt, stockInt, incomeInt, incomeGrowthInt, goalInt, principalInt, totalYears;
	private Font font;
	// *********************************
	
	// JTextFields *******
	private JTextArea incomeGrowth, monthlyExpenses, goalAmount, principalAmount, iText, igText,
	mExpense, mGoal, pAmount, sGrowth, stockGrowth, incomeText, product, instructions;
	// *******************

	public budgetAlgo()
	{
		//************************************************
		//setup and declaring variables
		//************************************************
		setLayout(null);
		setPreferredSize(new Dimension(1000,500));
		incomeGrowthArray = new ArrayList<Integer>();
		goalAmountArray = new ArrayList<Integer>();
		principalArray = new ArrayList<Integer>();
		incomeArray = new ArrayList<Integer>();
		stockGrowthArray = new ArrayList<Integer>();
		monthlyArray = new ArrayList<Integer>();
		Color customColor = new Color(204,153,255);
		setBackground(customColor);
		font = new Font("Courier", Font. BOLD,15);
	}

	//paints everything
	public void paintComponent(Graphics g) {
		//creates clickable JButtons
		delete = new JButton("del");
		delete.setBounds(150,280,30,30);
		delete.addActionListener(new delete());
		add(delete);
		
		clearAll = new JButton("clear");
		clearAll.setBounds(143,310,60,30);
		clearAll.addActionListener(new clear());
		clearAll.setBackground(getBackground());
		add(clearAll);
		
		incomeB = new JButton("Change");
		incomeB.setBounds(400,30,70,20);
		incomeB.addActionListener(new incomeBListen());	
		add(incomeB);
		
		monthlyB = new JButton("Change");
		monthlyB.setBounds(700,30,100,20);
		monthlyB.addActionListener(new monthlyBListen());	
		add(monthlyB);
		
		goalAmountB = new JButton("Change");
		goalAmountB.setBounds(30,140,150,20);
		goalAmountB.addActionListener(new goalAmountBListen());	
		add(goalAmountB);
		
		principalB = new JButton("Change");
		principalB.setBounds(400,140,150,20);
		principalB.addActionListener(new principalBListen());	
		add(principalB);
		
		incomeTextB = new JButton("Change");
		incomeTextB.setBounds(30,30,100,30);
		incomeTextB.addActionListener(new incomeTextBListen());	
		add(incomeTextB);
		
		stockB = new JButton("Change");
		stockB.setBounds(700,140,100,30);
		stockB.addActionListener(new stockBListen());	
		add(stockB);
		
		//creates JTextAreas that are going to be edited ******************************
		incomeGrowth = new JTextArea("");
		incomeGrowth.setBounds(400,60,70,20);
		incomeGrowth.setEditable(false);
		incomeGrowth.setWrapStyleWord(true);
		incomeGrowth.setLineWrap(true);
		add(incomeGrowth);
		
		incomeText = new JTextArea("");
		incomeText.setBounds(30,60,100,20);
		incomeText.setEditable(false);
		incomeText.setLineWrap(true);
		incomeText .setWrapStyleWord(true);
		add(incomeText);
		
		monthlyExpenses = new JTextArea("");
		monthlyExpenses.setBounds(700,60,100,20);
		monthlyExpenses.setEditable(false);
		monthlyExpenses.setLineWrap(true);
		monthlyExpenses.setWrapStyleWord(true);
		add(monthlyExpenses);
		
		goalAmount = new JTextArea("");
		goalAmount.setBounds(30,175,150,20);
		goalAmount.setEditable(false);
		goalAmount.setWrapStyleWord(true);
		goalAmount.setLineWrap(true);
		add(goalAmount);
		
		principalAmount = new JTextArea("");
		principalAmount.setBounds(400,175,150,20);
		principalAmount.setEditable(false);
		principalAmount.setWrapStyleWord(true);
		principalAmount.setLineWrap(true);
		add(principalAmount);
		
		stockGrowth = new JTextArea("");
		stockGrowth.setBounds(700,175,100,30);
		stockGrowth.setEditable(false);
		stockGrowth.setWrapStyleWord(true);
		stockGrowth.setLineWrap(true);
		add(stockGrowth);
		// *******************************************************************
		
		
		//shows where to enter what *********
		instructions = new JTextArea("Press change, then enter in your " + "\n" + " values using the numberpad.");
		instructions.setBounds(15,210,300,40);
		instructions.setFont(font);
		instructions.setEditable(false);
		instructions.setBackground(getBackground());
		add(instructions);
		
		product = new JTextArea("It will take __ years to reach your goal.");
		product.setBounds(370,300,300,40);
		product.setEditable(false);
		product.setBackground(getBackground());
		add(product);
		
		iText = new JTextArea("Enter post-tax annual income:");
		iText.setBounds(20,10,200,20);
		iText.setEditable(false);
		iText.setBackground(getBackground());
		add(iText);
		
		igText = new JTextArea("Enter your annual expected income growth rate: (as a %)");
		igText.setBounds(300,10,400,20);
		igText.setEditable(false);
		igText.setBackground(getBackground());
		add(igText);
		
		mGoal = new JTextArea("Enter the total amount you want to" + "\n" + "end up with:");
		mGoal.setBounds(30,100,350,50);
		mGoal.setEditable(false);
		mGoal.setBackground(getBackground());
		add(mGoal);
		
		mExpense = new JTextArea("Enter your monthly expenses:");
		mExpense.setBounds(700,10,300,20);
		mExpense.setEditable(false);
		mExpense.setBackground(getBackground());
		add(mExpense);
		
		pAmount = new JTextArea("Enter your principal amount:");
		pAmount.setBounds(400,100,250,20);
		pAmount.setEditable(false);
		pAmount.setBackground(getBackground());
		add(pAmount);
		
		sGrowth = new JTextArea("Enter expected annual stock growth: (as a %)" + "\n" + 
		"(10% is average market return)");
		sGrowth.setBounds(700,100,300,40);
		sGrowth.setEditable(false);
		sGrowth.setBackground(getBackground());
		add(sGrowth);
		// **********************************
		
		//***** JButton
		calculate = new JButton("Calculate:");
		calculate.addActionListener(new pressButton());
		calculate.setBounds(450,250,100,40);
		add(calculate);
		//*****
		
		//NUMBERS
		one = new JButton("1");
		one.addActionListener(new one());
		one.setBounds(50,250,30,30);
		add(one);
		
		two = new JButton("2");
		two.addActionListener(new two());
		two.setBounds(80,250,30,30);
		add(two);
		
		three = new JButton("3");
		three.addActionListener(new three());
		three.setBounds(110,250,30,30);
		add(three);
		
		four = new JButton("4");
		four.addActionListener(new four());
		four.setBounds(50,280,30,30);
		add(four);
		
		five = new JButton("5");
		five.addActionListener(new five());
		five.setBounds(80,280,30,30);
		add(five);
		
		six = new JButton("6");
		six.addActionListener(new six());
		six.setBounds(110,280,30,30);
		add(six);
		
		seven = new JButton("7");
		seven.addActionListener(new seven());
		seven.setBounds(50,310,30,30);
		add(seven);
		
		eight = new JButton("8");
		eight.addActionListener(new eight());
		eight.setBounds(80,310,30,30);
		add(eight);
		
		nine = new JButton("9");
		nine.addActionListener(new nine());
		nine.setBounds(110,310,30,30);
		add(nine);
		
		zero = new JButton("0");
		zero.addActionListener(new zero());
		zero.setBounds(80,340,30,30);
		add(zero);
	}
	// 2
	//calculates everything
	public int calculateYears() {	
		totalYears=0;
		monthlyInt = arrayCompressor(monthlyArray);
		stockInt = arrayCompressor(stockGrowthArray);
		incomeInt = arrayCompressor(incomeArray);
		incomeGrowthInt = arrayCompressor(incomeGrowthArray);
		goalInt = arrayCompressor(goalAmountArray);
		principalInt = arrayCompressor(principalArray);
		double percent = (incomeGrowthInt * 0.01) + 1;
		double stockPercent = (stockInt * 0.01) + 1;
		monthlyInt*=12;
		while (principalInt < goalInt)
		{
			principalInt += (int) ((incomeInt * percent) - monthlyInt);
			principalInt *= stockPercent;
			totalYears++;
			if (principalInt<0) return -1;
		}
		totalYears--;
		return totalYears;
	}
	
	
	//turns arrayList into an int
	public int arrayCompressor(ArrayList<Integer> b)
	{ 
		int newInt=0;
		for(int i=0; i<b.size(); i++) {
			newInt += (int) (b.get(i) * Math.pow(10,b.size()-i));	
		}
		return newInt/10;
	}
	
	//changes JTextArea value
	public void addValue(int a)
	{
		//delete key, a=10
		
		//prevents index out of bounds error
		if(changeValue==null) return;
		if(a==10 && changeValue.equals("incomeGrowth") && incomeGrowthArray.size()==0) return;
		if(a==10 && changeValue.equals("monthly") && monthlyArray.size()==0) return;
		if(a==10 && changeValue.equals("goalAmount") && goalAmountArray.size()==0) return;
		if(a==10 && changeValue.equals("principal") && principalArray.size()==0) return;
		if(a==10 && changeValue.equals("income") && incomeArray.size()==0) return;
		if(a==10 && changeValue.equals("stockGrowth") && stockGrowthArray.size()==0) return;
		
		if(a==10)
		{
			if(changeValue.equals("incomeGrowth")) incomeGrowthArray.remove(incomeGrowthArray.size()-1);
				for(Integer i : incomeGrowthArray)
			{
					incomeGrowth.append("" + i);
			}
			
			if(changeValue.equals("monthly")) monthlyArray.remove(monthlyArray.size()-1);
				for(Integer i : monthlyArray)
			{
					monthlyExpenses.append("" + i);
			}
				
			if(changeValue.equals("goalAmount")) goalAmountArray.remove(goalAmountArray.size()-1);
				for(Integer i : goalAmountArray)
			{
					goalAmount.append("" + i);
			}
				
			if(changeValue.equals("principal")) principalArray.remove(principalArray.size()-1);
				for(Integer i : principalArray)
				{
					principalAmount.append("" + i);
			}
				
			if(changeValue.equals("income")) incomeArray.remove(incomeArray.size()-1);
				for(Integer i : incomeArray)
				{
					incomeText.append("" + i);
			}
				
			if(changeValue.equals("stockGrowth")) stockGrowthArray.remove(stockGrowthArray.size()-1);
				for(Integer i : stockGrowthArray)
				{
					stockGrowth.append("" + i);
				}
				return;
		}
		
		if(changeValue.equals("incomeGrowth")) {
			incomeGrowthArray.add(a);
			for(Integer i : incomeGrowthArray)
		{
				incomeGrowth.append("" + i);
		}
		}
		if(changeValue.equals("monthly")) monthlyArray.add(a);
			for(Integer i : monthlyArray)
		{
				monthlyExpenses.append("" + i);
		}
		if(changeValue.equals("goalAmount")) goalAmountArray.add(a);
			for(Integer i : goalAmountArray)
		{
				goalAmount.append("" + i);
		}
		if(changeValue.equals("principal")) principalArray.add(a);
			for(Integer i : principalArray)
			{
				principalAmount.append("" + i);
		}
		if(changeValue.equals("income")) incomeArray.add(a);
			for(Integer i : incomeArray)
			{
				incomeText.append("" + i);
		}
		if(changeValue.equals("stockGrowth")) stockGrowthArray.add(a);
			for(Integer i : stockGrowthArray)
			{
				stockGrowth.append("" + i);
			}
	}
	
	//calculates total
		private class pressButton implements ActionListener
		{		
		public void actionPerformed(ActionEvent e) {
			calculateYears();	
			if(totalYears<0) product.setText("More data required.");
			else product.setText("It will take " + totalYears + " years to reach your goal.");
			}
		}
		
		
		// action listens for showInputDialog JButtons**********************
		private class incomeBListen implements ActionListener
		{		
		public void actionPerformed(ActionEvent e) {
			changeValue = "incomeGrowth";
			}
		}
		private class monthlyBListen implements ActionListener
		{		
		public void actionPerformed(ActionEvent e) {
			changeValue = "monthly";
			}
		}
		private class goalAmountBListen implements ActionListener
		{		
		public void actionPerformed(ActionEvent e) {
			changeValue = "goalAmount";
			}
		}
		private class principalBListen implements ActionListener
		{		
		public void actionPerformed(ActionEvent e) {
			changeValue = "principal";
			}
		}
		private class incomeTextBListen implements ActionListener
		{		
		public void actionPerformed(ActionEvent e) {
			changeValue = "income";
			}
		}
		private class stockBListen implements ActionListener
		{		
		public void actionPerformed(ActionEvent e) {
			changeValue = "stockGrowth";
			}
		}
		//***************************************************
		
		//numbers
		private class one implements ActionListener
		{		
		public void actionPerformed(ActionEvent e) {
			addValue(1);
			}
		}
		private class two implements ActionListener
		{		
		public void actionPerformed(ActionEvent e) {
			addValue(2);
			}
		}
		private class three implements ActionListener
		{		
		public void actionPerformed(ActionEvent e) {
			addValue(3);
			}
		}
		private class four implements ActionListener
		{		
		public void actionPerformed(ActionEvent e) {
			addValue(4);
			}
		}
		private class five implements ActionListener
		{		
		public void actionPerformed(ActionEvent e) {
			addValue(5);
			}
		}
		private class six implements ActionListener
		{		
		public void actionPerformed(ActionEvent e) {
			addValue(6);
			}
		}
		private class seven implements ActionListener
		{		
		public void actionPerformed(ActionEvent e) {
			addValue(7);
			}
		}
		private class eight implements ActionListener
		{		
		public void actionPerformed(ActionEvent e) {
			addValue(8);
			}
		}
		private class nine implements ActionListener
		{		
		public void actionPerformed(ActionEvent e) {
			addValue(9);
			}
		}
		private class zero implements ActionListener
		{		
		public void actionPerformed(ActionEvent e) {
			addValue(0);
			}
		}
		private class delete implements ActionListener
		{		
		public void actionPerformed(ActionEvent e) {
			if(changeValue.equals("incomeGrowth") && incomeGrowthArray.size()==1) {
				incomeGrowthArray.removeAll(incomeGrowthArray);			
			}
			if(changeValue.equals("monthly") && monthlyArray.size()==1) {
				monthlyArray.removeAll(monthlyArray);
			}
			if(changeValue.equals("goalAmount") && goalAmountArray.size()==1) {
				goalAmountArray.removeAll(goalAmountArray);
			}
			if(changeValue.equals("principal") && principalArray.size()==1) {
				principalArray.removeAll(principalArray);
			}
			if(changeValue.equals("income") && incomeArray.size()==1) {
				incomeArray.removeAll(incomeArray);
			}
			if(changeValue.equals("stockGrowth") && stockGrowthArray.size()==1) {
				stockGrowthArray.removeAll(stockGrowthArray);
			}
			addValue(10);
			}
		}		
		
		private class clear implements ActionListener
		{		
		public void actionPerformed(ActionEvent e) {
			incomeGrowthArray.removeAll(incomeGrowthArray);
			monthlyArray.removeAll(monthlyArray);
			goalAmountArray.removeAll(goalAmountArray);
			principalArray.removeAll(principalArray);
			incomeArray.removeAll(incomeArray);
			stockGrowthArray.removeAll(stockGrowthArray);
			repaint();
			}
		}		
	}
	
