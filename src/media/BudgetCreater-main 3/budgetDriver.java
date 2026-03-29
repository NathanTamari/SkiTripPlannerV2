package BudgetCreater;
// Title: budgetDriver.java
// Author: Nathan Tamari
// Client Class for  budgetAlgo

//imports for using java swing
import javax.swing.JFrame;
import java.awt.Color;

public class budgetDriver {
	public static void main (String[] args)
	{
		JFrame frame = new JFrame("Net Worth Growth Calculator");
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		frame.getContentPane().add(new budgetAlgo());
		frame.pack();
		frame.setVisible(true);
		frame.setResizable(false);	
		Color customColor = new Color(204,153,255);
		frame.setBackground(customColor);
	}
}